class VendorTag < ActiveRecord::Base
    # Relationships
    belongs_to :vendor
    belongs_to :tag
    
end
