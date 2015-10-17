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
    scope :by_tag, -> (tag) {joins(:tags).where('tags.name = ?', tag)}

    # Methods

    def cssTagClasses()
        tagIds = tags.collect { |tag| tag.id }
        tagIds = Set.new(tagIds)
        tagClass = ""
        tagIds.map { |tag_id| tagClass = tagClass + "tag_" + tag_id.to_s + " "}
        return tagClass
    end

end
