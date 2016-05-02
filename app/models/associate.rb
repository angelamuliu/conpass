class Associate < ActiveRecord::Base
    # Relationships
    belongs_to :vendor
    belongs_to :convention

    # Validations
    validates_presence_of :convention

    scope :alphabetical, order('last_name, first_name')

    def name
        "#{last_name}, #{first_name}"
    end

    def proper_name
        "#{first_name} #{last_name}"
    end

end
