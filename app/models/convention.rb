class Convention < ActiveRecord::Base
    # Relationships
    has_many :maps
    has_many :vendors, :dependent => :destroy
    has_many :tags, :dependent => :destroy
    has_many :vendor_tags, :through => :tags

    # Scopes 
    scope :alphabetical, -> {order('name')}
    scope :ongoing, -> {where('end_date >= ?', Date.current)}
    scope :upcoming, -> {where('start_date > ?', Date.current)}
end
