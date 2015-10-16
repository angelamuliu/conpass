class User < ActiveRecord::Base

  has_many :conventions, :dependent => :destroy

  
  has_secure_password
  # attr_accessible :name, :username, :password, :password_confirmation


  # Validations
  validates_presence_of :username
  validates_presence_of :password, :on => :create 
  validates_presence_of :password_confirmation, :on => :create 
  validates_confirmation_of :password, :message => "Passwords do not match."


  # Functions
  def self.authenticate(username, password)
    find_by_username(username).try(:authenticate, password)
  end

  
end

