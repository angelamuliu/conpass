class Booth < ActiveRecord::Base
    # Relationships
    belongs_to :vendor
    belongs_to :map

    # Validations
    # NOTE: DO NOT validate pressence of vendor_id!! This is so when making a map a user can go back later and add it in later ....

    
end
