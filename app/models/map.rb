require 'json'

class Map < ActiveRecord::Base
    # Relationships
    belongs_to :convention
    has_many :booths, :dependent => :destroy
    has_many :vendor_booths, :through => :booths

    # Validations
    validates_presence_of :convention, :name

    # Scopes
    scope :alphabetical, -> {order('name')}
    scope :chronological, ->{order('start_date')}

    # Methods


    # TODO !!!
    # When saveFromHistory is called, we need to validate that the
    # user actually OWNS the objects they are editing! Otherwise they could mess
    # with other ppls maps LOL

    # -------------------------
    # Mapcrafter methods (mapMaker.js related)
    # SAVING ORDER OF MODELS: Map, Vendor, Tag, Booth, Vendor_tag, Vendor_booth
    # SAVING ORDER OF ACTIONS: Create, Update, Delete

    # Temp Obj = Object that has never been saved to backend, is new

    # Takes an array of hashes (originally JSON) and saves to map instance and related objects
    def saveFromHistory(jsonActionHistory)
        categorizedHistory = organizeHistory(JSON.parse(jsonActionHistory))

        # Store new obj saved new IDs for vendorbooth, vendortag
        # EX STRUCTURE: {"booth" : {"t1" : 10, "t2" : actualID, ... }, "vendor" : {... } }
        tempToPerm = {"booth" => {}, "vendor" => {}, "tag" => {}}

        saveForModel("map", categorizedHistory, tempToPerm)
        saveForModel("vendor", categorizedHistory, tempToPerm)
        saveForModel("tag", categorizedHistory, tempToPerm)
        saveForModel("booth", categorizedHistory, tempToPerm)
        bulkSaveForVendorTag(categorizedHistory, tempToPerm)
        saveForModel("vendor_booth", categorizedHistory, tempToPerm)

        self.convention.touch # Refresh updated date for convention
    end

    # Takes array of hashes and organizes in types of actions so that we can save efficiently & properly
    # Vendor_tag is the only one organized differently due to how actions come in bulk. Positive = create, negative = destroy
    # EX STRUCTURE: { "booth" : {"create" : { "id" : {"x_pos" : 10, ...}, "id" : {...} },
    #                            "update" : { "id" : {...}, "id" : {...} }, ... }
    #                "vendor" : {"create" : { "id" : {...}, "id" : {...} } } ... } ...
    #                "vendor_tag" : { "vendor-id_tag-id" : 9, "vendor-id_tag-id" : -1, ... } }
    def organizeHistory(orderedHistory)
        categorizedHistory = {}

        for historyItem in orderedHistory

            # Initializing basic structure
            if historyItem["type"] == "vendor_tag"
                if !categorizedHistory.has_key?("vendor_tag")
                    categorizedHistory["vendor_tag"] = {}
                end
            else
                if categorizedHistory.has_key?(historyItem["type"])
                    if categorizedHistory[historyItem["type"]].has_key?(historyItem["action"]) == false
                        # Need to create the action hash for this history item
                        categorizedHistory[historyItem["type"]][historyItem["action"]] = {}
                    end
                else # Need to create both the type key and action hash value for it
                    categorizedHistory[historyItem["type"]] = {}
                    categorizedHistory[historyItem["type"]][historyItem["action"]] = {}
                end
            end

            if historyItem["type"] == "vendor_tag"
                # Organizing vendor_tag's special structure
                for createVT in historyItem["create"]
                    if !categorizedHistory["vendor_tag"].has_key?(createVT)
                        categorizedHistory["vendor_tag"][createVT] = 0
                    end
                    categorizedHistory["vendor_tag"][createVT] += 1
                end
                for destroyVT in historyItem["destroy"]
                    if !categorizedHistory["vendor_tag"].has_key?(destroyVT)
                        categorizedHistory["vendor_tag"][destroyVT] = 0
                    end
                    categorizedHistory["vendor_tag"][destroyVT] -= 1
                end
            else
                # Adding into right category, or updating/deleting as necessary
                case historyItem["action"]
                when "create"
                    categorizedHistory[historyItem["type"]][historyItem["action"]][historyItem["id"]] = historyItem
                when "update"
                    if historyItem.has_key?("isTemp") and historyItem["isTemp"] == true
                        # Instead of creating then updating, just update the create action for the temp obj
                        categorizedHistory[historyItem["type"]]["create"][historyItem["id"]] = historyItem
                    else
                        # Updating a previously SAVED obj
                        categorizedHistory[historyItem["type"]][historyItem["action"]][historyItem["id"]] = historyItem
                    end
                when "delete"
                    if historyItem.has_key?("isTemp") and historyItem["isTemp"] == true
                        # Instead of creating then deleting, just remove the create action for the temp obj
                        categorizedHistory[historyItem["type"]]["create"].delete(historyItem["id"])
                    else
                        # Deleting a previously SAVED obj
                        categorizedHistory[historyItem["type"]][historyItem["action"]][historyItem["id"]] = historyItem
                    end
                end
            end

        end
        return categorizedHistory
    end

    # Takes in model name and action hash (e.g. {"create" : {...}, "update" : {...}) and does actions
    def saveForModel(modelName, categorizedHistory, tempToPerm)
        if categorizedHistory.has_key?(modelName)
            actionHistory = categorizedHistory[modelName]
            createModels(modelName, actionHistory, tempToPerm)
            updateModels(modelName, actionHistory)
            deleteModels(modelName, actionHistory)
        end
    end

    # All creates are working off TEMP objs
    def createModels(modelName, actionHistory, tempToPerm)
        createActions = if actionHistory["create"].nil? then {} else actionHistory["create"] end
        for idKey in createActions.keys
            createAction = createActions[idKey]
            case modelName
            when "map"
            when "vendor"
                vendor = Vendor.create({name: createAction["name"], convention_id: self.convention_id, 
                    description: createAction["description"], website_url: createAction["website_url"]})
                tempToPerm["vendor"][idKey] = vendor.id
            when "tag"
                tag = Tag.create({name: createAction["name"], convention_id: self.convention_id})
                tempToPerm["tag"][idKey] = tag.id
            when "booth"
                booth = Booth.create({x_pos: createAction["x"].to_i, y_pos: createAction["y"].to_i, 
                    width: createAction["width"].to_i, height: createAction["height"].to_i, map_id: self.id})
                tempToPerm["booth"][idKey] = booth.id
            when "vendor_booth"
                VendorBooth.create({vendor_id: translateTempToPermId(createAction["vendor_id"], "vendor", tempToPerm), 
                    booth_id: translateTempToPermId(createAction["booth_id"], "booth", tempToPerm),
                    start_time: DateTime.parse(createAction["start_time"]), end_time: DateTime.parse(createAction["end_time"])})
            end
        end
    end

    # All updates working off of SAVED objs
    def updateModels(modelName, actionHistory)
        updateActions = if actionHistory["update"].nil? then {} else actionHistory["update"] end
        for idKey in updateActions.keys
            updateAction = updateActions[idKey]
            case modelName
            when "map"
                Map.update(updateAction["id"], name: updateAction["name"], width: updateAction["width"], 
                           height: updateAction["height"])
            when "vendor"
                Vendor.update(updateAction["id"], name: updateAction["name"], description: updateAction["description"],
                    website_url: updateAction["website_url"])
            when "tag"
                Tag.update(updateAction["id"], name: updateAction["name"])
            when "booth"
                Booth.update(updateAction["id"], x_pos: updateAction["x"].to_i, y_pos: updateAction["y"].to_i,
                    width: updateAction["width"].to_i, height: updateAction["height"].to_i)
            when "vendor_booth"
                VendorBooth.update(updateAction["id"], vendor_id: updateAction["vendor_id"], booth_id: updateAction["booth_id"],
                    start_time: DateTime.parse(updateAction["start_time"]), end_time: DateTime.parse(updateAction["end_time"]))
            end
        end
    end

    # All deletes are working off of SAVED objs
    def deleteModels(modelName, actionHistory)
        deleteActions = if actionHistory["delete"].nil? then {} else actionHistory["delete"] end
        for idKey in deleteActions.keys
            deleteAction = deleteActions[idKey]
            case modelName
            when "map"
            when "vendor"
                Vendor.find(deleteAction["id"]).destroy
            when "tag"
                Tag.find(deleteAction["id"]).destroy
            when "booth"
                Booth.find(deleteAction["id"]).destroy
            when "vendor_booth"
                VendorBooth.find(deleteAction["id"]).destroy
            end
        end
    end

    def bulkSaveForVendorTag(categorizedHistory, tempToPerm)
        if categorizedHistory.has_key?("vendor_tag")
            for vendorTagId in categorizedHistory["vendor_tag"].keys
                actionVal = categorizedHistory["vendor_tag"][vendorTagId]
                if actionVal != 0
                    vendorId = extractVendorID(vendorTagId, tempToPerm)
                    tagId = extractTagId(vendorTagId, tempToPerm)
                    if actionVal > 0 # CREATE
                        VendorTag.create({vendor_id: vendorId, tag_id: tagId})
                    elsif actionVal < 0 # DESTROY
                        VendorTag.where("vendor_id =#{vendorId} AND tag_id =#{tagId}").destroy_all
                    end
                end
            end
        end
    end


    # HELPERS

    # Given an id, if it is temp ("t10") then returns the perm ID
    # If it is perm ("10"), simply rereturns the original value
    def translateTempToPermId(id, type, tempToPerm)
        if id[0] == "t"
            return tempToPerm[type][id]
        else
            return id
        end
    end

    # Since we save vendortag IDS as vendor-1_tag-1 form, we need to extract
    # Also converts it to the perm vendor ID if it is temp
    def extractVendorID(vendorTagId, tempToPerm)
        rawVendorId = vendorTagId.split("_")[0]
        vendorId = rawVendorId[7..rawVendorId.size]
        if vendorId.include?("t")
            return tempToPerm["vendor"][vendorId]
        else
            return vendorId
        end
    end

    # Since we save vendortag IDS as vendor-1_tag-1 form, we need to extract
    # Also converts it to the perm tag ID if it is temp
    def extractTagId(vendorTagId, tempToPerm)
        rawTagId = vendorTagId.split("_")[1]
        tagId = rawTagId[4..rawTagId.size]
        if tagId.include?("t")
            return tempToPerm["tag"][tagId]
        else
            return tagId
        end
    end






end
