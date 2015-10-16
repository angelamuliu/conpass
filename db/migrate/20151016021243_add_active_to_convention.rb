class AddActiveToConvention < ActiveRecord::Migration
  def change
    add_column :conventions, :active, :boolean
  end
end
