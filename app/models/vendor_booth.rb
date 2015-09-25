class VendorBooth < ActiveRecord::Base
    # Relationships
    belongs_to :vendor
    belongs_to :booth
end
