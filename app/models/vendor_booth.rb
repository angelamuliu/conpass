class VendorBooth < ActiveRecord::Base
    # Relationships
    belongs_to :vendor
    belongs_to :booth

    # Needs to validate
    # MUST have start and end time!


    # Methods
    def timeRange()
        return start_time.strftime("%m/%-d %a %l:%M%P") + " - " + end_time.strftime("%m/%-d %a %l:%M%P")
    end

end
