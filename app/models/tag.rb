class Tag < ActiveRecord::Base
    # Relationships
    belongs_to :convention
    has_many :vendor_tags, :dependent => :destroy
    has_many :vendors, :through => :vendor_tags
    
    # Validations
    validates_presence_of :name
    #validates_inclusion_of :convention_id, in: Convention.all.map{|c| c.id}, message: "Convention does not exist"

    # Scopes
    scope :alphabetical, -> {order('name')}

end
