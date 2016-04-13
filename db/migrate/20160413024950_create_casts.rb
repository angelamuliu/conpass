class CreateCasts < ActiveRecord::Migration
  def change
    create_table :casts do |t|
      t.integer :convention_id
      t.string :upload

      t.timestamps
    end
  end
end