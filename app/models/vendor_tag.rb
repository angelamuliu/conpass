class VendorTag < ActiveRecord::Base
    # Relationships
    belongs_to :vendor
    belongs_to :tag

    # Validations
    validates_presence_of :vendor, :tag
    
end
