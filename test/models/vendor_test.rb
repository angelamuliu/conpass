require 'test_helper'

class VendorTest < ActiveSupport::TestCase
  # Relationships
  should belong_to(:convention)
  should have_many(:vendor_tags)
  should have_many(:vendor_booths)
  should have_many(:tags).through(:vendor_tags)
  should have_many(:booths).through(:vendor_booths)

  # Scopes
  context "Vendor" do
    setup do
      @convention = FactoryGirl.create(:convention)
      @map = FactoryGirl.create(:map)
      @vendor1 = FactoryGirl.create(:vendor, name: "Google")
      @vendor2 = FactoryGirl.create(:vendor, name: "Apple")
      @vendor3 = FactoryGirl.create(:vendor, name: "Yahoo")
      @tag1 = FactoryGirl.create(:tag, convention: @convention, name: "Internship")
      @tag2 = FactoryGirl.create(:tag, convention: @convention, name: "Full-time")
      @tag3 = FactoryGirl.create(:tag, convention: @convention, name: "International")
      @vt1a = FactoryGirl.create(:vendor_tag, vendor: @vendor1, tag: @tag1)
      @vt1b = FactoryGirl.create(:vendor_tag, vendor: @vendor1, tag: @tag2)
      @vt1c = FactoryGirl.create(:vendor_tag, vendor: @vendor1, tag: @tag3)
      @vt2a = FactoryGirl.create(:vendor_tag, vendor: @vendor1, tag: @tag1)
      @vt2b = FactoryGirl.create(:vendor_tag, vendor: @vendor1, tag: @tag2)
      @vt3a = FactoryGirl.create(:vendor_tag, vendor: @vendor1, tag: @tag1)
    end

    teardown do
      @convention.destroy
      @map.destroy
      @vendor1.destroy
      @vendor2.destroy
      @vendor3.destroy
      @tag1.destroy
      @tag2.destroy
      @tag3.destroy
      @vt1a.destroy
      @vt1b.destroy
      @vt1c.destroy
      @vt2a.destroy
      @vt2b.destroy
      @vt3a.destroy
  end

    # Scopes
    should "list vendors alphabetically" do
      assert_equal 3, Vendor.all.size
      assert_equal ["Apple", "Google", "Yahoo"], Vendor.alphabetical.map{|v| v.name}
    end

    should "list vendors by tag" do
      assert_equal ["Apple", "Google", "Yahoo"], Vendor.by_tag("Internship").alphabetical.map{|v| v.name}
      assert_equal ["Apple", "Google"], Vendor.by_tag("Full-time").alphabetical.map{|v| v.name}
      assert_equal ["Apple"], Vendor.by_tag("International").alphabetical.map{|v| v.name}
    end
  end
end
