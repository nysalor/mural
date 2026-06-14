module Api
  class ConfigController < ApplicationController
    def show
      config = Rails.configuration.mural

      render json: {
        display:          config[:display],
        interval_seconds: config.dig(:images, :interval_seconds)
      }
    end
  end
end
