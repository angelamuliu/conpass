class Vendor < ActiveRecord::Base
    # Relationships
    belongs_to :convention
    has_many :vendor_tags, :dependent => :destroy
    has_many :tags, :through => :vendor_tags
    has_many :vendor_booths, :dependent => :destroy
    has_many :booths,  :through => :vendor_booths
    
    # Validations 

    #Scopes
    scope :alphabetical, -> {order('name')}
    scope :by_tag, -> (tag) {joins(:vendor_tags, :tags).where('tags.name = ?', tag).order('tag.name')}
end
