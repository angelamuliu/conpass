require 'test_helper'

class ConventionTest < ActiveSupport::TestCase
  # Relationships
  should have_many(:maps)
  should have_many(:vendors)
  should have_many(:tags)

  # Validations
  should validate_presence_of(:name)
  
  context "Conventions" do
    setup do
      @boc = FactoryGirl.create(:convention, name: "BOC", start_date: Date.yesterday, end_date: Date.tomorrow)
      @toc = FactoryGirl.create(:convention, name: "TOC", start_date: 2.days.ago, end_date: 1.day.ago)
      @eoc = FactoryGirl.create(:convention, name: "EOC", start_date: Date.tomorrow, end_date: Date.tomorrow.tomorrow)
      @carnival = FactoryGirl.create(:convention, name: "Carnival", start_date: Date.today, end_date: Date.tomorrow)
    end

    teardown do
      @boc.destroy
      @toc.destroy
      @eoc.destroy
      @carnival.destroy
    end
    
    # Scopes

    should "list conventions alphabetically" do
      assert_equal 4, Convention.all.size
      assert_equal ["BOC", "Carnival", "EOC", "TOC"], Convention.alphabetical.map{|c| c.name}
    end

    should "list past conventions" do
      assert_equal ["TOC"], Convention.past.alphabetical.map{|c| c.name}

    end

    should "list current conventions" do
      assert_equal ["BOC", "Carnival"], Convention.current.alphabetical.map{|c| c.name}
    end

    should "list upcoming conventions" do
      assert_equal ["EOC"], Convention.upcoming.alphabetical.map{|c| c.name}
    end
  end
end
