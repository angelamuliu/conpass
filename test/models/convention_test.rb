require 'test_helper'

class ConventionTest < ActiveSupport::TestCase
  # Relationships
  should have_many(:maps)
  should have_many(:vendors)
  should have_many(:tags)

  # Validations
  # should validate_presence_of(:name)
  
  context "Create four conventions" do
    setup do
      @boc = FactoryGirl.create(:convention, name: "BOC")
      @toc = FactoryGirl.create(:convention, name: "TOC")
      @eoc = FactoryGirl.create(:convention, name: "EOC")
      @carnival = FactoryGirl.create(:convention, name: "Carnival")
    end

    teardown do
      @boc.destroy
      @toc.destroy
      @eoc.destroy
      @carnival.destroy
    end
    
    should "list conventions alphabetically" do
      assert_equal 4, Convention.all.size
      assert_equal ["BOC", "Carnival", "EOC", "TOC"], Convention.alphabetical.map{|c| c.name}
    end

    should "list ongoing conventions" do
      assert_equal ["BOC", "Carnival", "EOC", "TOC"], Convention.alphabetical.map{|c| c.name}
    end

    should "list upcoming conventions" do
      assert_equal ["BOC", "Carnival", "EOC", "TOC"], Convention.alphabetical.map{|c| c.name}
    end
  end
end
