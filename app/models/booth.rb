class Booth < ActiveRecord::Base
    # Relationships
    belongs_to :vendor
    belongs_to :map

    
end
