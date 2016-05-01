class Associate < ActiveRecord::Base
    # Relationships
    belongs_to :vendor
    belongs_to :convention

    # Validations
    validates_presence_of :convention

end
