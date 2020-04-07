import ntpath

def filename_from_path(path):
    _, t = ntpath.split(path)
    # need to handle cases where path has trailing slash
    return t
