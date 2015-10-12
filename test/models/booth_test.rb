require 'test_helper'

class BoothTest < ActiveSupport::TestCase
  # Relationships
  should belong_to(:map)
  should have_many(:vendor_booths)
  should have_many(:vendors).through(:vendor_booths)
end
