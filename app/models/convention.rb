class Convention < ActiveRecord::Base
    # Relationships
    belongs_to :user
    belongs_to :type
    has_many :maps, :dependent => :destroy
    has_one :location, :dependent => :destroy
    has_many :vendors, :dependent => :destroy
    has_many :associates, :through => :vendors
    has_many :tags, :dependent => :destroy
    has_many :vendor_tags, :through => :tags

    accepts_nested_attributes_for :location

    # Validations
    validates_presence_of :user, :type

    # Scopes 
    scope :alphabetical, -> {order('name')}
    scope :chronological, ->{order('start_date')}
    scope :updated, -> {order('updated_at').reverse_order}
    scope :current, -> {where('end_date >= ?', Date.current)}
    scope :upcoming, -> {where('start_date > ?', Date.current)}
    scope :active, -> {where('active = ?', true)}
    scope :inactive, -> {where('active = ?', false)}

    # Image Uploaders
    mount_uploader :logo, ImageUploader
    mount_uploader :banner, ImageUploader


    # Methods

    def toggleActive()
        if active # Active to inactive
            update({active: false})
        else # Inactive to active
            update({active: true})
        end
    end

    def dateRange()
        return start_date.strftime('%m/%d %l:%M %p') + " - " + end_date.strftime('%m/%d %l:%M %p')
    end

    # Given a search term and the sorting scheme currently applied. Can be called on a certain convention, 
    # and will search through the vendors + associates connected to said convention. 
    # Returns array of unique matching vendors
    def convention_vendor_search(search, sort="ABC")
        # First: Search for associates in case search = a name of an associate
        # lower is used to make it a case insensitive search
        associate_matches = associates.where("lower(first_name) LIKE ? OR lower(last_name) LIKE ?", 
                                                 "%#{search.downcase}%", "%#{search.downcase}%")
        vendorIDarr = associate_matches.map{|a| a.vendor_id}

        # Now we cover vendor name, as well as grabbing any vendors which matched associate earlier
        matches = vendors.where("lower(name) LIKE ? OR id IN (?)", "%#{search.downcase}%", vendorIDarr)
        case sort
        when "ABC"
            return matches.alphabetical
        else
            return matches
        end
    end

    # Class Methods

    # Creates a default convention for a user to look at for reference
    def self.makeDefault(user)
        sandboxType = ::Type.find_by_name("Sandbox") # :: -> To get to global namespace and get right type class
        con1 = Convention.create({name: "Example: Spicy Food Festival", start_date: Date.today, end_date: Date.tomorrow, 
                    user: user, active: false, type: sandboxType})
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

end
