class Convention < ActiveRecord::Base
    # Relationships
    has_many :maps
    has_many :vendors
    has_many :tags

    # Scopes 
    scope :alphabetical, -> {order('name')}
    scope :current, -> {where('end_date >= ?', Date.current)}
    scope :upcoming, -> {where('start_date > ?', Date.current)}
end
