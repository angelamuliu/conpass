require 'json'

class Map < ActiveRecord::Base
    # Relationships
    belongs_to :convention
    has_many :booths

    # Validations

    # Scopes

    # Methods

    # -------------------------
    # Mapcrafter methods (mapMaker.js related)
    # SAVING ORDER OF MODELS: Map, Vendor, Tag, Vendor_tag, Booth
    # SAVING ORDER OF ACTIONS: Create, Update, Delete

    # Takes an array of hashes (originally JSON) and saves to map instance and related objects
    def saveFromHistory(jsonActionHistory)
        puts self
        orderedHistory = JSON.parse(jsonActionHistory) # Array of hashes
        categorizedHistory = organizeHistory(orderedHistory)

        saveForModel("map", categorizedHistory)
        saveForModel("vendor", categorizedHistory)
        saveForModel("tag", categorizedHistory)
        saveForModel("vendor_tag", categorizedHistory)
        saveForModel("booth", categorizedHistory)

        byebug
    end

    # Takes array of hashes and organizes in types of actions so that we can save properly
    # EX STRUCTURE: { "booth" : {"create" : [{...}, ...], "update" : [...]},
    #                 "vendor" : {"create" : [...], ... } }
    def organizeHistory(orderedHistory)
        categorizedHistory = {}
        for historyItem in orderedHistory
            if categorizedHistory.has_key?(historyItem["type"])
                if categorizedHistory[historyItem["type"]].has_key?(historyItem["action"]) == false
                    # Need to create the action hash for this history item
                    categorizedHistory[historyItem["type"]][historyItem["action"]] = []
                end
            else # Need to create both the type key and action hash value for it
                categorizedHistory[historyItem["type"]] = {}
                categorizedHistory[historyItem["type"]][historyItem["action"]] = []
            end
            # Add in a history item in right categories
            categorizedHistory[historyItem["type"]][historyItem["action"]].push(historyItem)
        end
        return categorizedHistory
    end

    # Takes in model name and action hash (e.g. {"create" : [...], "update" : [...]}) and does actions
    def saveForModel(modelName, categorizedHistory)
        if categorizedHistory.has_key?(modelName)
            actionHistory = categorizedHistory[modelName]
            createModels(modelName, actionHistory)
            updateModels(modelName, actionHistory)
            deleteModels(modelName, actionHistory)
        end
    end

    def createModels(modelName, actionHistory)
        createActions = actionHistory["create"]
        for createAction in createActions
            case modelName
            when "map"
            when "vendor"
            when "tag"
            when "vendor_tag"
            when "booth"
                Booth.create({})
            end
        end
    end
# foo = Convention.create({name: "TEST"})
#     t.datetime "start_time"
#     t.datetime "end_time"
#     t.integer  "vendor_id"
#     t.integer  "x_pos"
#     t.integer  "y_pos"
#     t.integer  "width"
#     t.integer  "height"
#     t.datetime "created_at"
#     t.datetime "updated_at"
#     t.integer  "map_id"

    def updateModels(modelName, actionHistory)
        updateActions = actionHistory["update"]
        for updateAction in updateActions
            case modelName
            when "map"
            when "vendor"
            when "tag"
            when "vendor_tag"
            when "booth"
            end
        end
    end

    def deleteModels(modelName, actionHistory)
        deleteActions = actionHistory["delete"]
        for deleteAction in deleteActions
            case modelName
            when "map"
            when "vendor"
            when "tag"
            when "vendor_tag"
            when "booth"
            end
        end
    end






end
