class Map < ActiveRecord::Base
    # Relationships
    belongs_to :convention
    has_many :booths
    
    # Methods

end
