class CreateAssociates < ActiveRecord::Migration
  def change
    create_table :associates do |t|
      t.integer :vendor_id
      t.string :first_name
      t.string :last_name

      t.timestamps
    end
  end
end
