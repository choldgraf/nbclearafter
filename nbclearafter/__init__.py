def _jupyter_nbextension_paths():
    """
    Set up the notebook extension for displaying metrics
    """
    return [{
        "section": "notebook",
        "dest": "nbclearafter",
        "src": "static",
        "require": "nbclearafter/main"
    }]
