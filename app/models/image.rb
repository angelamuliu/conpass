class Image < ActiveRecord::Base
    # Relationships
    belongs_to :cast
    belongs_to :map

    # Validations
    validates_presence_of :cast, :map

end
