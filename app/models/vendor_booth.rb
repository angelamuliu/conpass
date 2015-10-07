class VendorBooth < ActiveRecord::Base
    # Relationships
    belongs_to :vendor
    belongs_to :booth

    # Validations
    validates_presence_of :start_time, :end_time

    # Scopes
    scope :chronological, -> {order('start_time')}
end
