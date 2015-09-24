class AddWidthHeightToMap < ActiveRecord::Migration
  def change
    add_column :maps, :width, :integer, default: 500
    add_column :maps, :height, :integer, default: 500
  end
end
