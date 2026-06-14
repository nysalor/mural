module Api
  class ConfigController < ApplicationController
    def show
      render json: {
        display:          mural_config[:display],
        interval_seconds: mural_config.dig(:images, :interval_seconds)
      }
    end
  end
end
