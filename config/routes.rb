Rails.application.routes.draw do

  resources :vendor_booths

  # Static pages
  get 'home' => 'home#index', :as => :home
  get 'dashboard' => 'home#dashboard', :as => :dashboard
  get 'about' => 'home#about', :as => :about
  get 'faq' => 'home#faq', :as => :faq
  get 'index_sam' => 'home#index_sam', :as => :index_sam
  get 'need_account' => 'home#need_account', :as => :need_account

  #Root url
  root :to => 'home#index'

  resources :vendor_tags
  resources :tags
  resources :booths
  resources :vendors

  resources :maps do
    get 'craft', :on => :member # Main map crafting drag and drop screen
    post 'save', :on => :member # Saving map and related from the craft screen
    get 'quickview', :on => :member, as: :quickview # For map makers, offers an administrative glance
  end

  resources :conventions do
    get 'quickview', :on => :member, as: :quickview # For map makers, offers administrative glance at convention
    get 'search', :on => :collection, as: :search
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
