class ChangeDefaultActiveToFalseConvention < ActiveRecord::Migration

    def up
        change_column_default :conventions, :active, false
    end

    def down
        change_column_default :conventions, :active, nil
    end
end
