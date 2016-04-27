class Image < ActiveRecord::Base

    enum layer: [:background, :below_booth, :above_booth, :top]

    # Relationships
    belongs_to :cast
    belongs_to :map

    # Validations
    validates_presence_of :cast, :map

    # Returns a CSS z-index for the image based on which layer it is placed on
    def z_index
        case layer
            when "background"
                return 15
            when "below_booth"
                return 20
            when "above_booth"
                return 35
            when "top"
                return 40
        end
        return 1
    end

end
