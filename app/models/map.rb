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
        orderedHistory = JSON.parse(jsonActionHistory) # Array of hashes
        categorizedHistory = organizeHistory(orderedHistory)

        saveForModel("map", categorizedHistory)
        saveForModel("vendor", categorizedHistory)
        saveForModel("tag", categorizedHistory)
        saveForModel("vendor_tag", categorizedHistory)
        saveForModel("booth", categorizedHistory)
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
        createActions = if actionHistory["create"].nil? then [] else actionHistory["create"] end
        for createAction in createActions
            case modelName
            when "map"
            when "vendor"
            when "tag"
            when "vendor_tag"
            when "booth"
                Booth.create({x_pos: createAction["x"].to_i, y_pos: createAction["y"].to_i, 
                    width: createAction["width"].to_i, height: createAction["height"].to_i, map_id: self.id})
            end
        end
    end

    def updateModels(modelName, actionHistory)
        updateActions = if actionHistory["update"].nil? then [] else actionHistory["update"] end
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
        deleteActions = if actionHistory["delete"].nil? then [] else actionHistory["delete"] end
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
