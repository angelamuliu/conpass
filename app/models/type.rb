class Type < ActiveRecord::Base
    has_many :conventions

    validates_presence_of :name, :description

    # Image Uploaders
    mount_uploader :default_logo, ImageUploader
    mount_uploader :default_banner, ImageUploader

end