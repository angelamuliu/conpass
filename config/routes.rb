Rails.application.routes.draw do

  resources :associates

  resources :vendor_booths

  # Static pages
  get 'home' => 'home#index', :as => :home
  get 'dashboard' => 'home#dashboard', :as => :dashboard
  get 'master_dashboard' => 'home#master_dashboard', :as => :master_dashboard
  get 'about' => 'home#about', :as => :about
  get 'faq' => 'home#faq', :as => :faq
  get 'need_account' => 'home#need_account', :as => :need_account

  #Root url
  root :to => 'home#index'

  resources :vendor_tags
  resources :tags
  resources :booths
  resources :vendors
  resources :types

  # Casts and images don't require as many paths
  post '/casts', to: 'casts#create'
  delete '/casts/:id', to: 'casts#destroy'

  resources :maps do
    get 'craft', :on => :member # Main map crafting drag and drop screen
    post 'save', :on => :member # Saving map and related from the craft screen
    get 'quickview', :on => :member, as: :quickview # For map makers, offers an administrative glance
  end

  resources :conventions do
    get 'quickview', :on => :member, as: :quickview # For map makers, offers administrative glance at convention
    get 'associates', :on => :member # Viewing associates connected to convention
    post 'vendor_search', :on => :member, as: :vendorSearch # Vendor search on show
    get 'search', :on => :collection, as: :search # Searching conventions on home
  end
    
    post 'toggle_active/:id' => 'conventions#toggle_active', as: :toggle_active

  # Authentication
  resources :users
  resources :sessions
  get 'user/edit' => 'users#edit', :as => :edit_current_user
  get 'signup' => 'users#new', :as => :signup
  get 'login' => 'sessions#new', :as => :login
  get 'logout' => 'sessions#destroy', :as => :logout

end
