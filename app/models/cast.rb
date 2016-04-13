class Cast < ActiveRecord::Base
    # A cast is uploaded media that is associated to a convention. It can be referred to 
    # on any of the convention's map through images, which are pointers to the cast's upload


    # Relationships
    belongs_to :convention
    has_many :images, :dependent => :destroy

    # Validations
    validates_presence_of :convention

    # Image Uploader
    mount_uploader :upload, ImageUploader

end
