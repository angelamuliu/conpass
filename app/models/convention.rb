class Convention < ActiveRecord::Base
    # Relationships
    belongs_to :user
    has_many :maps
    has_many :vendors, :dependent => :destroy
    has_many :tags, :dependent => :destroy
    has_many :vendor_tags, :through => :tags

    # Validations
    validates_presence_of :user

    # Scopes 
    scope :alphabetical, -> {order('name')}
    scope :chronological, ->{order('start_date')}
    scope :updated, -> {order('updated_at').reverse_order}
    scope :current, -> {where('end_date >= ?', Date.current)}
    scope :upcoming, -> {where('start_date > ?', Date.current)}
    scope :active, -> {where('active = ?', true)}
    scope :inactive, -> {where('active = ?', false)}


    # Methods

    def toggleActive()
        if active # Active to inactive
            update({active: false})
        else # Inactive to active
            update({active: true})
        end
    end



    # Creates a default convention for a user to look at for reference
    def self.makeDefault(user)
        con1 = Convention.create({name: "Example: Spicy Food Festival", start_date: Date.today, end_date: Date.tomorrow, 
                    user: user, active: false})
        map1 = Map.create({name: "Flagstaff Hill", convention: con1, width: 1000, height: 1000})
        map2 = Map.create({name: "Schenley Park", convention: con1})

        vendor1 = Vendor.create({name: "Tokio Chicken", convention: con1, website_url: "www.tokiochicken.com",
            "description": "We serve Korean fried chicken the way you like it - on fire!"})
        vendor2 = Vendor.create({name: "Serve & Shake", convention: con1, website_url: "www.serveshake.com",
            "description": "We've been serving your favorite burgers for 10 years from our food trucks."})
        vendor3 = Vendor.create({name: "Hola Seniorita", convention: con1, website_url: "",
            "description": "Can you take our spicy tacos?"})

        booth1 = Booth.create({x_pos: 150, y_pos: 150, width: 50, height: 100, map: map1})
        booth2 = Booth.create({x_pos: 250, y_pos: 150, width: 50, height: 100, map: map1})

        tag1 = Tag.create({convention: con1, name: "vegan"})
        tag2 = Tag.create({convention: con1, name: "gluten free"})
        tag3 = Tag.create({convention: con1, name: "vegetarian"})

        vb1 = VendorBooth.create({vendor: vendor1, booth: booth1, start_time: Date.today, end_time: Date.today + 1.hour})
        vb2 = VendorBooth.create({vendor: vendor2, booth: booth2, start_time: Date.today, end_time: Date.today + 3.hour})
        vb3 = VendorBooth.create({vendor: vendor3, booth: booth1, start_time: Date.today + 2.hour, end_time: Date.today + 3.hour})

        vt1 = VendorTag.create({vendor: vendor1, tag: tag1})
        vt2 = VendorTag.create({vendor: vendor2, tag: tag1})
        vt3 = VendorTag.create({vendor: vendor2, tag: tag2})
        vt4 = VendorTag.create({vendor: vendor2, tag: tag3})
    end

    def dateRange()
        return start_date.strftime('%m/%d %l:%M %p') + " - " + end_date.strftime('%m/%d %l:%M %p')
    end
end
