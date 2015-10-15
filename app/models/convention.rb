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
    scope :current, -> {where('end_date >= ?', Date.current)}
    scope :upcoming, -> {where('start_date > ?', Date.current)}

    def dateRange()
        return start_date.strftime('%m/%d %l:%M %p') + " - " + end_date.strftime('%m/%d %l:%M %p')
    end
end
