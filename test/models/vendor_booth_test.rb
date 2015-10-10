require 'test_helper'

class VendorBoothTest < ActiveSupport::TestCase
  # Relationships
  should belong_to(:vendor)
  should belong_to(:booth)

  # Validations
  should validate_presence_of(:start_time)
  should validate_presence_of(:end_time)
  
  # Scopes
  context "Vendor Booth Assignment" do
    setup do
      @convention = FactoryGirl.create(:convention)
      @map = FactoryGirl.create(:map)
      @vendor1 = FactoryGirl.create(:vendor, name: "Google")
      @vendor2 = FactoryGirl.create(:vendor, name: "Apple")
      @vendor3 = FactoryGirl.create(:vendor, name: "Yahoo")
      @booth1 = FactoryGirl.create(:booth, map: @map, x_pos: 10, y_pos: 10)
      
      @vb1 = FactoryGirl.create(:vendor_booth, vendor: @vendor1, booth: @booth1, start_time: Time.zone.parse('2015-01-27 01:00'), end_time: Time.zone.parse('2015-01-28 01:00'))
      @vb2 = FactoryGirl.create(:vendor_booth, vendor: @vendor2, booth: @booth1, start_time: Time.zone.parse('2015-01-24 01:00'), end_time: Time.zone.parse('2015-01-25 01:00'))
      @vb3 = FactoryGirl.create(:vendor_booth, vendor: @vendor3, booth: @booth1 start_time: Time.zone.parse('2015-01-22 01:00'), end_time: Time.zone.parse('2015-01-23 01:00'))

    end

    teardown do
      @convention.destroy
      @map.destroy
      @vendor1.destroy
      @vendor2.destroy
      @vendor3.destroy
      @booth1.destroy
      @vb1.destroy
      @vb2.destroy
      @vb3.destroy
    end
    
    # Scopes
    should "list vendor booth assignments chronologically" do
      assert_equal 3, VendorBooth.all.size
      assert_equal [@vb3, @vb2, @vb1], VendorBooth.chronological
    end

    # Methods
    should "return the correct timeRange" do
      assert_equal 
    end
  end
end
