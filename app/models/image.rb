class Image < ActiveRecord::Base

    enum layer: [:background, :below_booth, :above_booth, :top]

    # Relationships
    belongs_to :cast
    belongs_to :map

    # Validations
    validates_presence_of :cast, :map

    # Returns a CSS z-index for the image based on which layer it is placed on
    def z_index
        
    end

end
