class Vendor < ActiveRecord::Base
    # Relationships
    belongs_to :convention
    has_many :booths
    has_many :vendor_tags
    has_many :tags, :through => :vendor_tags
    
end
