using System;

namespace rss_editor
{
	public partial class warningImgDialog : Gtk.Dialog
	{
		public warningImgDialog ()
		{
			this.Build ();
		}

		protected void buttonOk_Clicked (object sender, System.EventArgs e)
		{
			this.Destroy();
		}
	}
}

