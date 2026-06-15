class ImagesController < ApplicationController
  def show
    directory = mural_config.dig(:images, :directory)
    filename  = File.basename(params[:filename])
    path      = File.join(directory, filename)

    if File.exist?(path) && File.file?(path)
      send_file path, disposition: :inline
    else
      head :not_found
    end
  end
end
