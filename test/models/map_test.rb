require 'test_helper'

class MapTest < ActiveSupport::TestCase
  # Relationships
  should belong_to(:convention)
  should have_many(:booths)
  should have_many(:vendors).through(:booths)
  
  # Validations
  should validate_presence_of(:name)
  should validate_numericality_of(:width).only_integer
  should validate_numericality_of(:height).only_integer
end
