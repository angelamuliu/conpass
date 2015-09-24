class Convention < ActiveRecord::Base
    # Relationships
    has_many :maps
    has_many :vendors
    has_many :tags
    
end
