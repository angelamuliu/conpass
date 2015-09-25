class Vendor < ActiveRecord::Base
    # Relationships
    belongs_to :convention
    has_many :vendor_tags
    has_many :tags, :through => :vendor_tags
    has_many :vendor_booths
    has_many :booths,  :through => :vendor_booths
    
end
