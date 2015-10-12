class Booth < ActiveRecord::Base
    # Relationships
    belongs_to :map
    has_many :vendor_booths, :dependent => :destroy
    has_many :vendors,  :through => :vendor_booths

    # Validations
    # NOTE: DO NOT validate pressence of vendor_booths!! This is so when making a map a user can go back later and add it in later ....

    def cssVendorClasses()
        vendorIds = vendors.collect { |vendor| vendor.id }
        vendorIds = Set.new(vendorIds)
        vendorClass = ""
        vendorIds.map {|vendor_id| vendorClass = vendorClass + "v" + vendor_id.to_s + " "}
        return vendorClass
    end
    
end