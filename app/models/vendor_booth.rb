class VendorBooth < ActiveRecord::Base
    # Relationships
    belongs_to :vendor
    belongs_to :booth

    # Validations
    validates_presence_of :start_time, :end_time
    validates_presence_of :vendor, :booth

    # Scopes
    scope :chronological, -> {order('start_time')}

    # Methods
    def timeRange()
      return start_time.strftime("%m/%-d %a %l:%M%P") + " - " + end_time.strftime("%m/%-d %a %l:%M%P")
    end
end
