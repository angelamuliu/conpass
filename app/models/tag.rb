class Tag < ActiveRecord::Base
    # Relationships
    belongs_to :convention
    has_many :vendor_tags
    has_many :vendors, :through => :vendor_tags
    
end
