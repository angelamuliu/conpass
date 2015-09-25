class Map < ActiveRecord::Base
    # Relationships
    belongs_to :convention
    has_many :booths

    # Validations

    # Scopes

    # Methods

    # -------------------------
    # Mapcrafter methods

    # Takes an array of hashes (originally JSON) and saves the map and related objects
    def saveFromHistory() {
        puts @map
        puts "SAVING!"
    }

    # Takes array of hashes and organizes in types of actions so that we can save properly
    def organizeHistory() {

    }

end
