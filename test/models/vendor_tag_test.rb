require 'test_helper'

class VendorTagTest < ActiveSupport::TestCase
  # Relationships
  should belong_to(:vendor)
  should belong_to(:tag)

end
