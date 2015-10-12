require 'test_helper'

class TagTest < ActiveSupport::TestCase
  # Relationships
  should belong_to(:convention)
  should have_many(:vendor_tags)
  should have_many(:vendors).through(:vendor_tags)

  # Validations
  should validate_presence_of(:name)
end
